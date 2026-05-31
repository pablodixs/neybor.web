import { differenceInYears, format, parseISO } from 'date-fns'
import { ptBR } from 'date-fns/locale'

const ISO_DATE_PREFIX_PATTERN = /^(\d{4})-(\d{2})-(\d{2})/

export function parseBirthDate(value: string) {
    const datePrefix = value.match(ISO_DATE_PREFIX_PATTERN)

    if (datePrefix) {
        const [, year, month, day] = datePrefix.map(Number)

        return new Date(year, month - 1, day)
    }

    return parseISO(value)
}

export function formatShortBirthDate(value: string) {
    return format(parseBirthDate(value), 'dd MMM yyyy', { locale: ptBR })
}

export function formatLongBirthDate(value: string) {
    return format(parseBirthDate(value), `dd 'de' MMMM 'de' yyyy`, {
        locale: ptBR,
    })
}

export function getAgeFromBirthDate(value: string) {
    return differenceInYears(new Date(), parseBirthDate(value))
}
