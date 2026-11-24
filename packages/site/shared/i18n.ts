import messages from './messages.json'
import { locale } from './locale'

export function t(message: keyof typeof messages): string {
  return locale.value === 'en' ? messages[message] : message
}

export function subdivisionCount(count: number): string {
  return locale.value === 'en'
    ? `${count} first-level subdivision${count === 1 ? '' : 's'}`
    : `${count} 个一级行政区`
}

export function mapLabel(name: string): string {
  return locale.value === 'en' ? `${name} map` : `${name}地图`
}
