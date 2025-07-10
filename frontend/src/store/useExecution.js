import { create } from "zustand";
import { axiosInstance } from "../utils/axios";
import toast from "react-hot-toast";

export const useExecutionStore = create((set) => ({
  isExecuting: false,
  submission: null,

  executeCode: async (
    source_code,
    stdin,
    expected_outputs,
    problemId,
    language
  ) => {
    try {
      set({ isExecuting: true });
      console.log(
        "Submission:",
        JSON.stringify({
          source_code,
          stdin,
          expected_outputs,
          problemId,
          language,
        })
      );
      const res = await axiosInstance.post(`/execute-code/${problemId}/run`, {
        source_code,
        stdin,
        expected_outputs,
        problemId,
        language,
      });

      set({ submission: res.data.data });

      toast.success(res.data.message);
    } catch (error) {
      console.log("Error executing code", error);
      toast.error("Error executing code");
    } finally {
      set({ isExecuting: false });
    }
  },
}));
