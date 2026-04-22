package com.example.demo.author.dto;

import jakarta.validation.constraints.*;
import java.sql.Date;
import java.util.Objects;

public class UpdateAuthorDTO {

    @Size(min = 3, max = 255, message = "El nombre del autor debe tener entre 3 y 255 caracteres")
    private String name;

    private Date birthDate;

    public UpdateAuthorDTO(String name, Date birthDate){
        this.name = name;
        this.birthDate = birthDate;
    }

    public UpdateAuthorDTO() {
    }

    public @Size(min = 3, max = 255, message = "El nombre del autor debe tener entre 3 y 255 caracteres") String getName() {
        return name;
    }

    public void setName(@Size(min = 3, max = 255, message = "El nombre del autor debe tener entre 3 y 255 caracteres") String name) {
        this.name = name;
    }

    public @NotNull(message = "La fecha de nacimiento no puede ser nula") Date getBirthDate() {
        return birthDate;
    }

    public void setBirthDate(@NotNull(message = "La fecha de nacimiento no puede ser nula") Date birthDate) {
        this.birthDate = birthDate;
    }


    @Override
    public boolean equals(Object o) {
        if (this == o) return true;
        if (o == null || getClass() != o.getClass()) return false;
        UpdateAuthorDTO that = (UpdateAuthorDTO) o;
        return Objects.equals(name, that.name) && Objects.equals(birthDate, that.birthDate);
    }

    @Override
    public int hashCode() {
        return Objects.hash(name, birthDate);
    }

    @Override
    public String toString() {
        return "UpdateAuthorDTO{" +
                "name='" + name + '\'' +
                ", birthDate=" + birthDate +
                '}';
    }
}
