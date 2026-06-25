import { describe, expect, it } from 'vitest'
import {
  describeHttpStatus,
  HTTP_STATUS,
  HTTP_STATUS_IN_APP,
  HTTP_STATUS_REASON,
  isHttpStatusCode,
} from './httpStatus.js'

describe('HTTP_STATUS', () => {
  it('documents conflict semantics for duplicate resources', () => {
    expect(HTTP_STATUS.CONFLICT).toBe(409)
    expect(HTTP_STATUS_IN_APP[HTTP_STATUS.CONFLICT]).toMatch(/duplicate alert symbol/)
  })

  it('maps each code to an RFC reason', () => {
    for (const status of Object.values(HTTP_STATUS)) {
      expect(HTTP_STATUS_REASON[status]).toBeTruthy()
      expect(describeHttpStatus(status)).toBeTruthy()
    }
  })

  it('narrows unknown numbers with isHttpStatusCode', () => {
    expect(isHttpStatusCode(401)).toBe(true)
    expect(isHttpStatusCode(418)).toBe(false)
  })
})
