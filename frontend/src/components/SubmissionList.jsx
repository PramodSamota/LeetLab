import React from "react";
import {
  CheckCircle2,
  XCircle,
  Clock,
  MemoryStick as Memory,
  Calendar,
} from "lucide-react";

const SubmissionsList = ({ submissions, isLoading }) => {

  console.log("submissions :",submissions)
  // // Helper function to safely parse JSON strings
  // const safeParse = (data) => {
  //   try {
  //     return JSON.parse(data);
  //   } catch (error) {
  //     console.error("Error parsing data:", error);
  //     return [];
  //   }
  // };
 

  // Loading state
  if (isLoading) {
    return (
      <div className="flex justify-center items-center p-8">
        <span className="loading loading-spinner loading-lg text-primary"></span>
      </div>
    );
  }

  // No submissions state
  if (!submissions?.length) {
    return (
      <div className="text-center p-8">
        <div className="text-base-content/70">No submissions yet</div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {submissions.map((submission) => {
        const avgMemory = (submission.memory);
        const avgTime = (submission.time);

        return (
          <div
            key={submission.id}
            className="card bg-base-200 shadow-lg hover:shadow-xl transition-shadow rounded-lg"
          >
            <div className="card-body p-4">
              <div className="flex items-center justify-between">
                {/* Left Section: Status and Language */}
                <div className="flex items-center gap-4">
                  {submission.status === "Accepted" ? (
                    <div className="flex items-center gap-2 text-success">
                      <CheckCircle2 className="w-6 h-6" />
                      <span className="font-semibold">Accepted</span>
                    </div>
                  ) : (
                    <div className="flex items-center gap-2 text-error">
                      <XCircle className="w-6 h-6" />
                      <span className="font-semibold">{submission.status}</span>
                    </div>
                  )}
                  <div className="badge badge-neutral">{submission.language}</div>
                </div>

                {/* Right Section: Runtime, Memory, and Date */}
                <div className="flex items-center gap-4 text-base-content/70">
                  <div className="flex items-center gap-1">
                    <Clock className="w-4 h-4" />
                    <span>{avgTime} s</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Memory className="w-4 h-4" />
                    <span>{avgMemory} KB</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Calendar className="w-4 h-4" />
                    <span>
                      {new Date(submission.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default SubmissionsList;