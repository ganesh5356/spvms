package com.example.svmps.exception;

import java.util.HashMap;
import java.util.Map;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;

@RestControllerAdvice
public class GlobalExceptionHandler {
    
    @ExceptionHandler(MethodArgumentNotValidException.class)
    public ResponseEntity<Map<String,Object>> handleValidationError(MethodArgumentNotValidException ex) {
        Map<String, Object> body = new HashMap<>();
        Map<String, String> errors = new HashMap<>();
        ex.getBindingResult().getFieldErrors().forEach(error ->
            errors.put(error.getField(), error.getDefaultMessage())
        );
        body.put("message", "Validation failed");
        body.put("errors", errors);
        return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(body);
    }

    @ExceptionHandler(IllegalArgumentException.class)
    public ResponseEntity<Map<String,String>> handleBadRequest(IllegalArgumentException ex) {
        Map<String,String> body = new HashMap<>();
        body.put("error", ex.getMessage());
        return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(body);
    }

    @ExceptionHandler(RuntimeException.class)
    public ResponseEntity<Map<String,String>> handleRuntime(RuntimeException ex) {
        Map<String,String> body = new HashMap<>();
        body.put("error", ex.getMessage());
        // Return 400 for validation errors, 404 for not found
        HttpStatus status = ex.getMessage().contains("inactive") || ex.getMessage().contains("Validation")
                ? HttpStatus.BAD_REQUEST 
                : HttpStatus.NOT_FOUND;
        return ResponseEntity.status(status).body(body);
    }

    @ExceptionHandler(org.springframework.dao.DataIntegrityViolationException.class)
    public ResponseEntity<Map<String,String>> handleDbIntegrity(org.springframework.dao.DataIntegrityViolationException ex) {
        Map<String,String> body = new HashMap<>();
        String msg = ex.getRootCause() != null ? ex.getRootCause().getMessage() : ex.getMessage();
        body.put("error", "Database error: " + msg);
        return ResponseEntity.status(HttpStatus.CONFLICT).body(body);
    }
}
