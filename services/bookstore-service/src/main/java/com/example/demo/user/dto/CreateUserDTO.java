package com.example.demo.user.dto;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import java.util.Objects;

public class CreateUserDTO {

    @NotBlank(message = "The username cannot be blank")
    private String name;
    @NotBlank(message = "The password cannot be blank")
    @Size(min = 8, message = "The password must be at least 8 characters long")
    private String password;

    public CreateUserDTO(String name, String password) {
        this.name = name;
        this.password = password;
    }

    public CreateUserDTO() {
    }

    public @NotBlank(message = "The username cannot be blank") String getName() {
        return name;
    }

    public void setName(@NotBlank(message = "The username cannot be blank") String name) {
        this.name = name;
    }

    public @NotBlank(message = "The password cannot be blank") @Size(min = 8, message = "The password must be at least 8 characters long") String getPassword() {
        return password;
    }

    public void setPassword(@NotBlank(message = "The password cannot be blank") @Size(min = 8, message = "The password must be at least 8 characters long") String password) {
        this.password = password;
    }


    @Override
    public boolean equals(Object o) {
        if (this == o) return true;
        if (o == null || getClass() != o.getClass()) return false;
        CreateUserDTO that = (CreateUserDTO) o;
        return Objects.equals(name, that.name) && Objects.equals(password, that.password);
    }

    @Override
    public int hashCode() {
        return Objects.hash(name, password);
    }

    @Override
    public String toString() {
        return "CreateUserDTO{" +
                "name='" + name + '\'' +
                ", password='" + password + '\'' +
                '}';
    }
}
