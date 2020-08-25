import UserInput from '../resolvers/UserInput'

export const validateRegister = (options: UserInput) => {
  if (!options.email.includes('@')) {
    return [
      {
        field: 'email',
        message: 'invalid email',
      },
    ]
  } else if (options.username.length <= 2) {
    return [
      {
        field: 'username',
        message: 'username length must be greater than 2',
      },
    ]
  } else if (options.username.includes('@')) {
    return [
      {
        field: 'username',
        message: 'username cannot include @',
      },
    ]
  } else if (options.password.length <= 2) {
    return [
      {
        field: 'password',
        message: 'password length must be greater than 2',
      },
    ]
  }

  return []
}