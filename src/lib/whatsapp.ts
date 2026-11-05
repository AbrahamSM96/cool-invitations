import type { EventType } from '@/event-types'

/**
 * Text sent with a guest's link, e.g. "¡Hola, Abraham y Ana! Con mucho
 * cariño te compartimos la invitación a la boda de Viridiana & Daniel: …".
 *
 * @param event - Event the invitation is for.
 * @param event.type - Event type, for the wording.
 * @param event.hostsName - Names shown on the invitation.
 * @param guestName - Guest display name.
 * @param link - Guest's private link.
 */
export function invitationMessage(
  event: { type: EventType; hostsName: string },
  guestName: string,
  link: string
): string {
  const what = {
    birthday: `al cumpleaños de ${event.hostsName}`,
    general: `de ${event.hostsName}`,
    wedding: `a la boda de ${event.hostsName}`,
    xv: `a los XV años de ${event.hostsName}`,
  }[event.type]
  return `¡Hola, ${guestName}! Con mucho cariño te compartimos la invitación ${what}. Ábrela aquí y confirma tu asistencia: ${link}`
}

/**
 * `wa.me` link that opens a chat with the text ready to send.
 *
 * @param phone - Number from `normalizePhone` (digits with country code).
 * @param text - Message.
 */
export function whatsappLink(phone: string, text: string): string {
  return `https://wa.me/${phone}?text=${encodeURIComponent(text)}`
}
