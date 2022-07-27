type Data = {
  points: number
  whitelisted: boolean
  latitude?: string
  longitude?: string
  city?: string
}

export interface IMainOutput {
  [key: string]: Data
}
