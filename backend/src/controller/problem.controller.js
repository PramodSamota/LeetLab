import {
  asyncHandler,
  handleZodError,
  ApiError,
  logger,
  ApiResponse,
} from "../utils/index.js";
import { db } from "../libs/db.js";
import { validateCreateProblem } from "../validator/problem.validate.js";

import {
  getJudge0LanguageById,
  pollBatchResult,
  submitBatch,
} from "../utils/judge0.js";

const createProblem = asyncHandler(async (req, res) => {
  const {
    title,
    description,
    difficulty,
    tags,
    examples,
    constraints,
    hints,
    testcases,
    codeSnippets,
    referenceSolutions,
  } = handleZodError(validateCreateProblem(req.body));

  console.log("examples", examples);
  console.log("tags", tags);
  console.log("testcases", testcases);

  const userRole = req.user.role;

  if (userRole.toUpperCase() !== "ADMIN") {
    logger.error("Unauthorized Request");
    throw new ApiError(403, "You are not allowed to create a problem");
  }

  const existingProblem = await db.problem.findFirst({
    where: { title },
  });

  if (existingProblem) {
    throw new ApiError(409, "Problem already exists");
  }

  // const solutionEntries = Object.entries(referenceSolutions);

  // for (const [language, solutionCode] of solutionEntries) {
  //   // console.log("solutionCode::", solutionCode);
  //   const languageId = getJudge0LanguageById(language);

  //   console.log("languageId", languageId);

  //   if (!languageId) {
  //     logger.error(`Invalid language: ${language}`);
  //     throw new ApiError(400, `Invalid language: ${language}`);
  //   }
  //   console.log("tescases..", testcases);
  //   const submissions = testcases.map(({ input, output }) => {
  //     return {
  //       source_code: solutionCode,
  //       language_id: languageId,
  //       stdin: input,
  //       expected_output: output,
  //     };
  //   });
  //   console.log("submissions :", submissions);
  //   const tokens = await submitBatch(submissions);
  //   console.log("tokens :", tokens);

  //   const results = await pollBatchResult(tokens);
  //   console.log("results :", results);

  //   for (let i = 0; i < results.length; i++) {
  //     const result = results[i];

  //     if (result.status.id !== 3) {
  //       logger.error(`Submission ${i + 1} failed:${result.status.description}`);
  //       throw new ApiError(400, `Submission ${i + 1}`);
  //     }
  //   }
  // }

  for (const [language, solutionCode] of Object.entries(referenceSolutions)) {
    // Step 2.1: Get Judge0 language ID for the current language
    const languageId = getJudge0LanguageById(language);
    if (!languageId) {
      return res
        .status(400)
        .json({ error: `Unsupported language: ${language}` });
    }

    // Step 2.2: Prepare Judge0 submissions for all test cases
    const submissions = testcases.map(({ input, output }) => ({
      source_code: solutionCode,
      language_id: languageId,
      stdin: input,
      expected_output: output,
    }));

    console.log("Submissions:", submissions);

    // TODO: CONVERT SUBMISSION TO CHUNKS OF 20

    // Step 2.3: Submit all test cases in one batch
    const submissionResults = await submitBatch(submissions);

    // Step 2.4: Extract tokens from response
    const tokens = submissionResults.map((res) => res.token);
    console.log("tokens..", tokens);
    // Step 2.5: Poll Judge0 until all submissions are done
    const results = await pollBatchResult(tokens);
    console.log("results..:", results);
    // Step 2.6: Validate that each test case passed (status.id === 3)
    for (let i = 0; i < results.length; i++) {
      const result = results[i];
      if (result.status.id !== 3) {
        return res.status(400).json({
          error: `Validation failed for ${language} on input: ${submissions[i].stdin}`,
          details: result,
        });
      }
    }
  }
  const newProblem = await db.problem.create({
    data: {
      title,
      description,
      difficulty: difficulty.toUpperCase(),
      tags,
      examples,
      constraints,
      hints,
      testcases,
      codeSnippets,
      referenceSolutions,
      userId: req.user.id,
    },
  });

  return res
    .status(201)
    .json(new ApiResponse(201, newProblem, "Problem created successfully"));
});

const getProblemById = asyncHandler(async (req, res) => {
  const { pid } = req.params;

  const problem = await db.problem.findFirst({
    where: { id: pid },
  });

  if (!problem) {
    throw new ApiError(404, "Probelm not found");
  }

  res
    .status(200)
    .json(new ApiResponse(200, problem, "Problem feteched successfully"));
});

const getAllProblems = asyncHandler(async (req, res) => {
  const problems = await db.problem.findMany({
    include: {
      SolvedBy: {
        where: {
          userId: req.user.id,
        },
      },
    },
  });

  if (!problems) {
    throw new ApiError(404, "No Problems found");
  }

  res
    .status(200)
    .json(new ApiResponse(200, problems, "All problems feteched successfully"));
});

const deleteProblem = asyncHandler(async (req, res) => {
  const { pid } = req.params;

  const deletedProblem = await db.problem.deleteMany({ where: { id: pid } });

  if (deletedProblem.count === 0) {
    throw new ApiError(404, "Problem not found");
  }

  res
    .status(200)
    .json(new ApiResponse(200, null, "Problem deleted successfully"));
});

const updateProblem = asyncHandler(async (req, res) => {});

const getAllProblemsSolvedByUser = asyncHandler(async (req, res) => {
  const userId = req.user.id;
  const problems = await db.problem.findMany({
    where: {
      SolvedBy: {
        some: {
          userId,
        },
      },
    },
    include: {
      SolvedBy: {
        where: {
          userId,
        },
      },
    },
  });

  res
    .status(200)
    .json(new ApiResponse(200, problems, "Problem Fetched Successfully"));
});

const isProblemSolved = asyncHandler(async (req, res) => {
  const userId = req.user.id;
  const { pid } = req.params;

  let problemSolved = false;

  const foundProblem = await db.problemSolved.findFirst({
    where: {
      userId: userId,
      problemId: pid,
    },
  });

  if (foundProblem) {
    problemSolved = true;
  }

  return res
    .status(200)
    .json(new ApiResponse(200, problemSolved, "This Problem is Solved"));
});

export {
  createProblem,
  deleteProblem,
  updateProblem,
  getProblemById,
  getAllProblems,
  getAllProblemsSolvedByUser,
  isProblemSolved,
};
