module.exports = {
  apps: [
    {
      name: "Wheel of Styles",
      script: "npx",
      interpreter: "none",
      args: "serve -s build -l 4000",
      watch: true,
    },
  ],
};
