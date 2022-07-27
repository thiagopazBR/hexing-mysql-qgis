const check_latitude = (lat: string): boolean => {
  if (!lat) return false

  while (lat.length > 12) lat = lat.slice(0, -1)

  if (!lat.match(/^(\+|-)?(?:90(?:(?:\.0{1,6})?)|(?:[0-9]|[1-8][0-9])(?:(?:\.[0-9]{1,8})?))$/))
    return false
  else return true
}

const check_longitude = (long: string): boolean => {
  if (!long) return false

  while (long.length > 13) long = long.slice(0, -1)

  if (
    !long.match(
      /^(\+|-)?(?:180(?:(?:\.0{1,6})?)|(?:[0-9]|[1-9][0-9]|1[0-7][0-9])(?:(?:\.[0-9]{1,9})?))$/
    )
  )
    return false
  else return true
}

export { check_latitude, check_longitude }
