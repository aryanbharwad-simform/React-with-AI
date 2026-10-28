import type { ComponentProps } from 'react'
import { buttonClasses, type ButtonVariant } from '@/lib/styles'

// Accepts every normal <button> prop (onClick, disabled, type...) plus a `variant`.
interface ButtonProps extends ComponentProps<'button'> {
  variant?: ButtonVariant
}

export function Button({ variant = 'primary', className = '', type = 'button', ...rest }: ButtonProps) {
  return <button type={type} className={`${buttonClasses(variant)} ${className}`} {...rest} />
}
