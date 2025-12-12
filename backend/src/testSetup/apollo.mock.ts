jest.mock("@apollo/server", () => {
  return {
    ApolloServer: jest.fn().mockImplementation(() => ({
      startInBackgroundHandlingStartupErrorsByLoggingAndFailingAllRequests:
        jest.fn(),
      assertStarted: jest.fn(),
    })),
  };
});
