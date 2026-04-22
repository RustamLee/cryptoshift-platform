package com.example.demo.author.dto;

import java.sql.Date;
import java.util.Objects;

public class AuthorDTOReduced {
    private Long id;
    private String name;
    private Date birthDate;

    public AuthorDTOReduced(Long id, String name, Date birthDate) {
        this.id = id;
        this.name = name;
        this.birthDate = birthDate;
    }

    public AuthorDTOReduced(String name, Date birthDate) {
        this.name = name;
        this.birthDate = birthDate;
    }

    public AuthorDTOReduced() {
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public Date getBirthDate() {
        return birthDate;
    }

    public void setBirthDate(Date birthDate) {
        this.birthDate = birthDate;
    }

    @Override
    public boolean equals(Object o) {
        if (this == o) return true;
        if (o == null || getClass() != o.getClass()) return false;
        AuthorDTOReduced authorDTO = (AuthorDTOReduced) o;
        return Objects.equals(name, authorDTO.name) && Objects.equals(birthDate, authorDTO.birthDate);
    }

    @Override
    public int hashCode() {
        return Objects.hash(id, name, birthDate);
    }

    @Override
    public String toString() {
        return "AuthorDTO{" +
                "id=" + id +
                ", name='" + name + '\'' +
                ", birthDate=" + birthDate +
                '}';
    }
}
