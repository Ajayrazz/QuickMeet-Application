import { HttpException } from '@nestjs/common';
export declare class InvalidCredentialsException extends HttpException {
    constructor();
}
export declare class TokenExpiredException extends HttpException {
    constructor();
}
export declare class UserAlreadyExistsException extends HttpException {
    constructor();
}
export declare class SlotFullException extends HttpException {
    constructor();
}
export declare class DuplicateBookingException extends HttpException {
    constructor();
}
export declare class SlotNotOpenException extends HttpException {
    constructor();
}
export declare class ForbiddenResourceException extends HttpException {
    constructor();
}
