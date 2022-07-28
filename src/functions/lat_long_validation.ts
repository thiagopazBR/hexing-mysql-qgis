const check_latitude = (lat: string): string => {
  if (!lat) return '0'

  while (lat.length > 12) lat = lat.slice(0, -1)

  if (!lat.match(/^(\+|-)?(?:90(?:(?:\.0{1,6})?)|(?:[0-9]|[1-8][0-9])(?:(?:\.[0-9]{1,8})?))$/))
    return '0'
  else return lat
}

const check_longitude = (long: string): string => {
  if (!long) return '90'

  while (long.length > 13) long = long.slice(0, -1)

  if (
    !long.match(
      /^(\+|-)?(?:180(?:(?:\.0{1,6})?)|(?:[0-9]|[1-9][0-9]|1[0-7][0-9])(?:(?:\.[0-9]{1,9})?))$/
    )
  )
    return '90'
  else return long
}

export { check_latitude, check_longitude }
