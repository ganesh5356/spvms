package com.example.svmps.exception;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.ControllerAdvice;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.multipart.MultipartException;

@ControllerAdvice
public class GlobalExceptionHandler {

        @ExceptionHandler(MultipartException.class)
        public ResponseEntity<String> handleMultipartException(MultipartException e) {
                System.err.println("Multipart Exception caught: " + e.getMessage());
                if (e.getCause() != null) {
                        System.err.println("Root cause: " + e.getCause().getMessage());
                }
                e.printStackTrace();
                return ResponseEntity.status(500).body("Multipart error: " + e.getMessage());
        }

        @ExceptionHandler(IllegalArgumentException.class)
        public ResponseEntity<String> handleIllegalArgumentException(IllegalArgumentException e) {
                return ResponseEntity.badRequest().body(e.getMessage());
        }
}
