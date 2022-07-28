type Data = {
  points: number
  latitude?: string
  longitude?: string
  city?: string
}

export interface IMainOutput {
  [key: string]: Data
}
