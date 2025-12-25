package com.example.svmps.config;

import java.util.HashSet;
import java.util.Set;

import org.springframework.boot.ApplicationArguments;
import org.springframework.boot.ApplicationRunner;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.stereotype.Component;

import com.example.svmps.entity.Role;
import com.example.svmps.entity.User;
import com.example.svmps.repository.RoleRepository;
import com.example.svmps.repository.UserRepository;

@Component
public class DataSeedRunner implements ApplicationRunner {

    private final RoleRepository roleRepository;
    private final UserRepository userRepository;
    private final BCryptPasswordEncoder passwordEncoder = new BCryptPasswordEncoder();

    public DataSeedRunner(RoleRepository roleRepository, UserRepository userRepository) {
        this.roleRepository = roleRepository;
        this.userRepository = userRepository;
    }

    @Override
    public void run(ApplicationArguments args) {
        // create roles if absent
        createRoleIfNotExists("ADMIN", "Administrator");
        createRoleIfNotExists("PROCUREMENT", "Procurement team");
        createRoleIfNotExists("FINANCE", "Finance team");
        createRoleIfNotExists("VENDOR", "Vendor");

        // seed admin user if not exists
        if (!userRepository.existsByUsername("admin")) {
            User admin = new User();
            admin.setUsername("admin");
            admin.setEmail("admin@local");
            admin.setPassword(passwordEncoder.encode("Admin@123")); // change this password
            admin.setIsActive(true);

            Set<Role> roles = new HashSet<>();
            Role adminRole = roleRepository.findByName("ADMIN").orElseThrow();
            roles.add(adminRole);
            admin.setRoles(roles);

            userRepository.save(admin);

            System.out.println("Seeded default admin user: admin / Admin@123");
        }
    }

    private void createRoleIfNotExists(String name, String desc) {
        if (!roleRepository.existsByName(name)) {
            Role r = new Role();
            r.setName(name);
            r.setDescription(desc);
            roleRepository.save(r);
        }
    }
}
