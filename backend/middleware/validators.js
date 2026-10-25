// ========================================================
// THE IMOVIES - Request Validation & Sanitization Middleware
// ========================================================

const EMAIL_REGEX = /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)+$/;

/**
 * Validate user registration request body
 */
const validateRegister = (req, res, next) => {
  const errors = [];
  let { name, email, password } = req.body;

  // Name validation
  if (!name || typeof name !== 'string' || name.trim().length === 0) {
    errors.push('Full name is required.');
  } else if (name.trim().length < 2) {
    errors.push('Full name must be at least 2 characters.');
  } else if (name.trim().length > 60) {
    errors.push('Full name cannot exceed 60 characters.');
  }

  // Email validation
  if (!email || typeof email !== 'string' || email.trim().length === 0) {
    errors.push('Email address is required.');
  } else {
    email = email.trim().toLowerCase();
    if (email.length > 254) {
      errors.push('Email address is too long.');
    } else if (!EMAIL_REGEX.test(email)) {
      errors.push('Please enter a valid email address (e.g. user@example.com).');
    }
  }

  // Password validation
  if (!password || typeof password !== 'string') {
    errors.push('Password is required.');
  } else if (password.length < 6) {
    errors.push('Password must be at least 6 characters long.');
  } else if (password.length > 128) {
    errors.push('Password cannot exceed 128 characters.');
  }

  if (errors.length > 0) {
    return res.status(400).json({
      success: false,
      message: errors[0],
      errors,
    });
  }

  // Sanitize cleaned inputs
  req.body.name = name.trim();
  req.body.email = email.trim().toLowerCase();
  next();
};

/**
 * Validate user login request body
 */
const validateLogin = (req, res, next) => {
  const errors = [];
  let { email, password } = req.body;

  if (!email || typeof email !== 'string' || email.trim().length === 0) {
    errors.push('Email address is required.');
  } else {
    email = email.trim().toLowerCase();
    if (!EMAIL_REGEX.test(email)) {
      errors.push('Please enter a valid email address format.');
    }
  }

  if (!password || typeof password !== 'string' || password.length === 0) {
    errors.push('Password is required.');
  }

  if (errors.length > 0) {
    return res.status(400).json({
      success: false,
      message: errors[0],
      errors,
    });
  }

  req.body.email = email.trim().toLowerCase();
  next();
};

/**
 * Validate profile update request body
 */
const validateProfileUpdate = (req, res, next) => {
  const errors = [];
  let { name, currentPassword, newPassword } = req.body;

  if (name !== undefined) {
    if (typeof name !== 'string' || name.trim().length === 0) {
      errors.push('Name cannot be empty.');
    } else if (name.trim().length < 2) {
      errors.push('Name must be at least 2 characters long.');
    } else if (name.trim().length > 60) {
      errors.push('Name cannot exceed 60 characters.');
    } else {
      req.body.name = name.trim();
    }
  }

  if (newPassword !== undefined && newPassword !== '') {
    if (!currentPassword) {
      errors.push('Current password is required to set a new password.');
    }
    if (typeof newPassword !== 'string' || newPassword.length < 6) {
      errors.push('New password must be at least 6 characters long.');
    } else if (newPassword.length > 128) {
      errors.push('New password cannot exceed 128 characters.');
    }
  }

  if (errors.length > 0) {
    return res.status(400).json({
      success: false,
      message: errors[0],
      errors,
    });
  }

  next();
};

module.exports = {
  validateRegister,
  validateLogin,
  validateProfileUpdate,
};
