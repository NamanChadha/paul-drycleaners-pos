export const SALUTATIONS = ['Mr.', 'Mrs.', 'Ms.', 'Dr.', 'None'] as const
export type Salutation = (typeof SALUTATIONS)[number]

/**
 * Splits a full name into a salutation prefix and clean name.
 * e.g. "Mr. Rajesh Sharma" -> { title: "Mr.", cleanName: "Rajesh Sharma" }
 * e.g. "Mrs Anita Gupta" -> { title: "Mrs.", cleanName: "Anita Gupta" }
 * e.g. "Sharma" -> { title: "Mr.", cleanName: "Sharma" }
 */
export function splitCustomerTitle(fullName: string): { title: Salutation; cleanName: string } {
  if (!fullName) return { title: 'Mr.', cleanName: '' }
  const trimmed = fullName.trim()

  const prefixMap: Array<{ prefix: string; title: Salutation }> = [
    { prefix: 'Mr. ', title: 'Mr.' },
    { prefix: 'Mr ', title: 'Mr.' },
    { prefix: 'Mrs. ', title: 'Mrs.' },
    { prefix: 'Mrs ', title: 'Mrs.' },
    { prefix: 'Ms. ', title: 'Ms.' },
    { prefix: 'Ms ', title: 'Ms.' },
    { prefix: 'Miss. ', title: 'Ms.' },
    { prefix: 'Miss ', title: 'Ms.' },
    { prefix: 'Dr. ', title: 'Dr.' },
    { prefix: 'Dr ', title: 'Dr.' },
    { prefix: 'Sh. ', title: 'Mr.' },
    { prefix: 'Sh ', title: 'Mr.' },
    { prefix: 'Shri. ', title: 'Mr.' },
    { prefix: 'Shri ', title: 'Mr.' },
    { prefix: 'Smt. ', title: 'Mrs.' },
    { prefix: 'Smt ', title: 'Mrs.' },
  ]

  for (const item of prefixMap) {
    if (trimmed.toLowerCase().startsWith(item.prefix.toLowerCase())) {
      return {
        title: item.title,
        cleanName: trimmed.slice(item.prefix.length).trim(),
      }
    }
  }

  return { title: 'Mr.', cleanName: trimmed }
}

/**
 * Combines salutation and clean name into a full name.
 * If title is 'None' or empty, returns just cleanName.
 */
export function combineCustomerName(title: string, cleanName: string): string {
  const name = cleanName.trim()
  if (!name) return ''
  const t = title.trim()
  if (!t || t.toLowerCase() === 'none') return name
  if (name.toLowerCase().startsWith(t.toLowerCase())) return name
  return `${t} ${name}`
}
