import raw from './mercury.json'
import type { Dataset } from './types'

export const dataset = raw as unknown as Dataset
export * from './types'
