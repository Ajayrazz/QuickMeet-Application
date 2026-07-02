"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.calculateETA = void 0;
const calculateETA = (position, avgServiceDurationMinutes) => {
    if (position <= 1) {
        return 0;
    }
    return (position - 1) * avgServiceDurationMinutes;
};
exports.calculateETA = calculateETA;
//# sourceMappingURL=eta.util.js.map