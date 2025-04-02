export { };

declare global {
    type TMutationErrorData = { errors?: [{ message: string, field?: string }] };
}
