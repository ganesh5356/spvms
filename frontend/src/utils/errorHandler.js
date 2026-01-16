// Helper function to extract error message from various backend error formats
export function extractErrorMessage(err) {
  if (!err) return 'An error occurred'
  
  // If err.data exists, try to extract message from it
  if (err.data) {
    // Errors object with field names as keys (prioritize this for validation errors)
    if (err.data.errors && typeof err.data.errors === 'object' && Object.keys(err.data.errors).length > 0) {
      const errorMessages = []
      for (const [field, msg] of Object.entries(err.data.errors)) {
        if (Array.isArray(msg)) {
          errorMessages.push(`${field}: ${msg.join(', ')}`)
        } else {
          errorMessages.push(`${field}: ${msg}`)
        }
      }
      if (errorMessages.length > 0) return errorMessages.join('\n')
    }
    
    // Direct message field
    if (err.data.message) return err.data.message
    
    // Field errors array
    if (err.data.fieldErrors && Array.isArray(err.data.fieldErrors)) {
      const errorMessages = err.data.fieldErrors.map(f => 
        `${f.field}: ${f.message}`
      )
      if (errorMessages.length > 0) return errorMessages.join('\n')
    }
    
    // Violation messages array (from validation constraint violations)
    if (err.data.violations && Array.isArray(err.data.violations)) {
      const errorMessages = err.data.violations.map(v => v.message)
      if (errorMessages.length > 0) return errorMessages.join('\n')
    }
    
    // Direct string response
    if (typeof err.data === 'string') return err.data
    
    // JSON stringified data
    if (typeof err.data === 'object') {
      // Try to find any field that might contain an error message
      for (const [key, value] of Object.entries(err.data)) {
        if (key.toLowerCase().includes('error') || key.toLowerCase().includes('message')) {
          if (typeof value === 'string') return value
          if (Array.isArray(value) && value.length > 0) return value.join(', ')
        }
      }
    }
  }
  
  // Fallback to error message
  if (err.message) return err.message
  
  return 'Request failed'
}
