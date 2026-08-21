export const tolzaState = {
  config: undefined as string | undefined,

  executable: undefined as string | undefined,

  buildMode: undefined as string | undefined,

  checkRunning: false,

  generation: 0,
};

export const tolzaParameters = {
  path_toolchain: "" as string,

  path_compiler: "" as string,

  command_check_args: "" as string,

  command_build_args: "" as string,
};
