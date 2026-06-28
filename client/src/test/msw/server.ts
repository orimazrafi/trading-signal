import { setupServer } from 'msw/node'

/** Shared MSW server for client tests that mock HTTP at the network boundary. */
export const mswServer = setupServer()
