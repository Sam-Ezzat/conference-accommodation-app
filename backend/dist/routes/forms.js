"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const FormController_1 = require("@/controllers/FormController");
const router = (0, express_1.Router)();
router.get('/validation/:formType', FormController_1.FormController.getValidationRules);
router.post('/validation/:formType', FormController_1.FormController.validateFormData);
router.get('/template/:formType', FormController_1.FormController.getFormTemplate);
exports.default = router;
//# sourceMappingURL=forms.js.map