import { createTask } from "@lilbunnyrabbit/task-manager";

export default createTask<number, { value: number }>({
  name: "Create Object",

  parse() {
    switch (this.status) {
      case "idle":
        return {
          status: "Waiting to create object...",
        };
      case "in-progress":
        return {
          status: "Creating object...",
        };
      case "error":
        return {
          status: "Failed to create object!",
          errors: this.errors?.map((e) => e.message),
        };
      case "success": {
        if (this.result.isPresent()) {
          const { value } = this.result.get();

          return {
            status: "Object created!",
            result: `Value: ${value}`,
          };
        }

        return {
          status: "Object created! With no result???",
        };
      }
    }
  },

  async execute(value) {
    if (value > 100) {
      this.addWarning(`Value "${value}" is > 100.`);
    }

    return { value };
  },
});
