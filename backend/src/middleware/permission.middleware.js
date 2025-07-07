import { ApiError, asyncHandler, logger } from "../utils/index.js";

const checkPermission = (role) => {
  return asyncHandler(async (req, res, next) => {
    const userRole = req.user.role;
    console.log("userRole..", userRole);
    console.log("role.", role);
    console.log("req.user.", req.user);
    if (userRole !== role) {
      logger.error("User is not Authorized to do this task");
      throw new ApiError(403, "User is not Authorized to do this task");
    }
    next();
  });
};

export { checkPermission };
