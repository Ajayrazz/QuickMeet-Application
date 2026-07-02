"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ForbiddenResourceException = exports.SlotNotOpenException = exports.DuplicateBookingException = exports.SlotFullException = exports.UserAlreadyExistsException = exports.TokenExpiredException = exports.InvalidCredentialsException = void 0;
const common_1 = require("@nestjs/common");
class InvalidCredentialsException extends common_1.HttpException {
    constructor() {
        super('Invalid credentials', common_1.HttpStatus.UNAUTHORIZED);
    }
}
exports.InvalidCredentialsException = InvalidCredentialsException;
class TokenExpiredException extends common_1.HttpException {
    constructor() {
        super('Token has expired or is invalid', common_1.HttpStatus.UNAUTHORIZED);
    }
}
exports.TokenExpiredException = TokenExpiredException;
class UserAlreadyExistsException extends common_1.HttpException {
    constructor() {
        super('User with this email already exists', common_1.HttpStatus.CONFLICT);
    }
}
exports.UserAlreadyExistsException = UserAlreadyExistsException;
class SlotFullException extends common_1.HttpException {
    constructor() {
        super('This slot is fully booked', common_1.HttpStatus.CONFLICT);
    }
}
exports.SlotFullException = SlotFullException;
class DuplicateBookingException extends common_1.HttpException {
    constructor() {
        super('You already have an active booking for this slot', common_1.HttpStatus.CONFLICT);
    }
}
exports.DuplicateBookingException = DuplicateBookingException;
class SlotNotOpenException extends common_1.HttpException {
    constructor() {
        super('This slot is not currently open for bookings', common_1.HttpStatus.BAD_REQUEST);
    }
}
exports.SlotNotOpenException = SlotNotOpenException;
class ForbiddenResourceException extends common_1.HttpException {
    constructor() {
        super('You do not have permission to modify this resource', common_1.HttpStatus.FORBIDDEN);
    }
}
exports.ForbiddenResourceException = ForbiddenResourceException;
//# sourceMappingURL=domain.exceptions.js.map