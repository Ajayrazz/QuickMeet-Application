import { HttpException, HttpStatus } from '@nestjs/common';

export class InvalidCredentialsException extends HttpException {
  constructor() {
    super('Invalid credentials', HttpStatus.UNAUTHORIZED);
  }
}

export class TokenExpiredException extends HttpException {
  constructor() {
    super('Token has expired or is invalid', HttpStatus.UNAUTHORIZED);
  }
}

export class UserAlreadyExistsException extends HttpException {
  constructor() {
    super('User with this email already exists', HttpStatus.CONFLICT);
  }
}

export class SlotFullException extends HttpException {
  constructor() {
    super('This slot is fully booked', HttpStatus.CONFLICT);
  }
}

export class DuplicateBookingException extends HttpException {
  constructor() {
    super('You already have an active booking for this slot', HttpStatus.CONFLICT);
  }
}

export class SlotNotOpenException extends HttpException {
  constructor() {
    super('This slot is not currently open for bookings', HttpStatus.BAD_REQUEST);
  }
}

export class ForbiddenResourceException extends HttpException {
  constructor() {
    super('You do not have permission to modify this resource', HttpStatus.FORBIDDEN);
  }
}
