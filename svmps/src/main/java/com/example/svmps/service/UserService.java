package com.example.svmps.service;

import com.example.svmps.dto.UserDto;
import com.example.svmps.entity.User;
import com.example.svmps.repository.UserRepository;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

@Service
public class UserService {

    private final UserRepository userRepository;

    public UserService(UserRepository userRepository) { this.userRepository = userRepository; }

    public UserDto createUser(UserDto dto) {
        User u = new User();
        u.setUsername(dto.getUsername());
        // NOTE: In prod, hash the password. For dev/testing, plain text is OK (but insecure).
        u.setPassword(dto.getPassword());
        u.setEmail(dto.getEmail());
        u.setIsActive(dto.getIsActive() == null ? true : dto.getIsActive());
        User saved = userRepository.save(u);
        return toDto(saved);
    }

    public List<UserDto> getAllUsers() {
        return userRepository.findAll().stream().map(this::toDto).collect(Collectors.toList());
    }

    public UserDto toDto(User u) {
        UserDto dto = new UserDto();
        dto.setId(u.getId());
        dto.setUsername(u.getUsername());
        dto.setEmail(u.getEmail());
        dto.setIsActive(u.getIsActive());
        return dto;
    }
}
