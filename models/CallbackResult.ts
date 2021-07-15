export default interface CallbackResult
{
    status: number
}

export function CR_SUCCESS(status: number)
{
    return status >= 200 && status < 300;
}