package com.example.demo.user.controler;

import com.example.demo.exceptions.AlreadyExistingException;
import com.example.demo.exceptions.NotFoundException;
import com.example.demo.user.dto.CreateUserDTO;
import com.example.demo.user.dto.UpdateUserDTO;
import com.example.demo.user.dto.UserDTO;
import com.example.demo.user.dto.AdminUpdateUserDTO;
import com.example.demo.user.service.UserServiceImpl;
import com.example.demo.user.model.User;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Optional;

@RestController
@RequestMapping("/api/users")
public class UserControler {

    private final UserServiceImpl userService;

    public UserControler(UserServiceImpl userService) {
        this.userService = userService;
    }


    @GetMapping
    public ResponseEntity<List<UserDTO>> getAllUsers() {
        List<UserDTO> users = userService.getAll();
        return ResponseEntity.ok(users);
    }

    @GetMapping("/{id}")
    public ResponseEntity<UserDTO> getUserById (@PathVariable Long id) {
        Optional<UserDTO> user = userService.getById(id);
        return user.map(ResponseEntity::ok).orElse(ResponseEntity.notFound().build());
    }

    @PostMapping("/register")
    public ResponseEntity<UserDTO> createUser(@Valid @RequestBody CreateUserDTO createUserDTO){
        try {
            // if a user exists but is inactive, return 403 so frontend shows inactive-account message
            if (userService.existsAndInactive(createUserDTO.getName())) {
                return ResponseEntity.status(HttpStatus.FORBIDDEN).build();
            }
            UserDTO userDTO = userService.createUser(createUserDTO);
            return new ResponseEntity<>(userDTO, HttpStatus.CREATED);
        }catch (AlreadyExistingException e){
            return new ResponseEntity<>(HttpStatus.NOT_ACCEPTABLE);
        }
    }

    @PutMapping("/update")
    public ResponseEntity<UserDTO> updateUser(@Valid @RequestBody UpdateUserDTO updateUserDTO){
        try {
            Optional<UserDTO> updatedUser = userService.updateUser( updateUserDTO);
            return updatedUser.map(ResponseEntity::ok)
                    .orElse(ResponseEntity.notFound().build());
        }catch (NotFoundException e){
            return ResponseEntity.notFound().build();
        } catch (com.example.demo.exceptions.UnautorizedException e) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
        }
    }

    @PutMapping("/{id}")
    public ResponseEntity<UserDTO> updateUser(@PathVariable Long id,@Valid @RequestBody UpdateUserDTO updateUserDTO){
        Optional<UserDTO> updatedUser = userService.updateSpecificUser(id, updateUserDTO);
        return updatedUser.map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @PutMapping("/{id}/admin")
    public ResponseEntity<UserDTO> adminUpdateUser(@PathVariable Long id, @RequestBody AdminUpdateUserDTO adminUpdate){
        try {
            Optional<UserDTO> updated = userService.updateUserByAdmin(id, adminUpdate);
            return updated.map(ResponseEntity::ok).orElse(ResponseEntity.notFound().build());
        } catch (NotFoundException e) {
            return ResponseEntity.notFound().build();
        } catch (com.example.demo.exceptions.UnautorizedException e) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).build();
        }
    }

    @GetMapping("/{id}/admin/can-delete")
    public ResponseEntity<Boolean> canDeleteUser(@PathVariable Long id) {
        try {
            boolean canDelete = userService.canDeleteUserById(id);
            return ResponseEntity.ok(canDelete);
        } catch (NotFoundException e) {
            return ResponseEntity.notFound().build();
        } catch (com.example.demo.exceptions.UnautorizedException e) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).build();
        }
    }

    @DeleteMapping("/delete")
    public ResponseEntity<Void> deleteUser(){
        try {
            userService.deleteUser();
            return new ResponseEntity<>(HttpStatus.NO_CONTENT);
        } catch (NotFoundException e) {
            return ResponseEntity.notFound().build();
        }
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteUserById(@PathVariable Long id){
        try {
            userService.deleteUserById(id);
            return new ResponseEntity<>(HttpStatus.NO_CONTENT);
        } catch (NotFoundException e) {
            return ResponseEntity.notFound().build();
        } catch (com.example.demo.exceptions.UnautorizedException e) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).build();
        }
    }

    @GetMapping("/me")
    public ResponseEntity<UserDTO> getMe() {
        try {
            User user = userService.getCurrentUser();
            UserDTO dto = userService.convertToDTO(user);
            return ResponseEntity.ok(dto);
        } catch (NotFoundException e) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
        }
    }
}
