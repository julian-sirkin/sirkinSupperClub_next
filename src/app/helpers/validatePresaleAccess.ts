export type PresaleConfig = {
    presaleEnabled?: boolean | null
    presalePassword?: string | null
    presaleEndsAt?: Date | string | null
}

export type ValidatePresaleAccessProps = {
    config: PresaleConfig
    providedPassword?: string | null
    now?: Date
}

export type ValidatePresaleAccessResult = {
    isValid: boolean
    errorMessage: string | null
}

const parsePresaleEndDate = (presaleEndsAt: PresaleConfig["presaleEndsAt"]): Date | null => {
    if (!presaleEndsAt) {
        return null
    }

    const endDate = presaleEndsAt instanceof Date ? presaleEndsAt : new Date(presaleEndsAt)
    return Number.isNaN(endDate.getTime()) ? null : endDate
}

export const isPresaleActive = (config: PresaleConfig, now: Date = new Date()): boolean => {
    if (!config.presaleEnabled) {
        return false
    }

    const presaleEndDate = parsePresaleEndDate(config.presaleEndsAt)
    if (!presaleEndDate) {
        return false
    }

    return now < presaleEndDate
}

export const validatePresaleAccess = ({
    config,
    providedPassword,
    now = new Date(),
}: ValidatePresaleAccessProps): ValidatePresaleAccessResult => {
    if (!isPresaleActive(config, now)) {
        return { isValid: true, errorMessage: null }
    }

    if (!config.presalePassword) {
        return { isValid: true, errorMessage: null }
    }

    if (!providedPassword?.trim()) {
        return {
            isValid: false,
            errorMessage: "Presale password is required while presale is active.",
        }
    }

    const normalizedProvidedPassword = providedPassword.trim()
    const normalizedExpectedPassword = config.presalePassword.trim()

    if (normalizedProvidedPassword !== normalizedExpectedPassword) {
        return {
            isValid: false,
            errorMessage: "Presale password is incorrect.",
        }
    }

    return { isValid: true, errorMessage: null }
}
