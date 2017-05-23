export function captureAWS<T>(awssdk: T): T
export function captureAWSClient<T>(client: T): T
export function captureFunc(name: string)

export class Segment {
  constructor(name: string, rootId?: string, parentId?: string);
}

export as namespace AWSXRay
