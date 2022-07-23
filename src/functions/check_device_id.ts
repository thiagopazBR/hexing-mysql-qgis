const check_device_id = (device_id: string): string | boolean => {
  if (!device_id.match(/^[0-9]+$/)) return false

  const d: number = parseInt(device_id)
  if (d < -2147483648 || d > 2147483647) return false

  if (device_id.startsWith('0000'))
    while (device_id.charAt(0) === '0') device_id = device_id.slice(1)

  if (device_id.length < 8) return false

  return device_id
}

export { check_device_id }
