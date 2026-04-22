package com.example.demo.author.dto;

import com.example.demo.book.dto.BookDTOReduced;

import java.sql.Date;
import java.util.List;
import java.util.Objects;

public class AuthorDTO {

    private Long id;
    private String name;
    private Date birthDate;
    private List<BookDTOReduced> bookslist;

    public AuthorDTO(Long id, String name, Date birthDate, List<BookDTOReduced> bookslist) {
        this.id = id;
        this.name = name;
        this.birthDate = birthDate;
        this.bookslist = bookslist;
    }

    public AuthorDTO(String name, Date birthDate, List<BookDTOReduced> bookslist) {
        this.name = name;
        this.birthDate = birthDate;
        this.bookslist = bookslist;
    }

    public AuthorDTO() {
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

    public List<BookDTOReduced> getBookslist() {
        return bookslist;
    }

    public void setBookslist(List<BookDTOReduced> bookslist) {
        this.bookslist = bookslist;
    }

    @Override
    public boolean equals(Object o) {
        if (this == o) return true;
        if (o == null || getClass() != o.getClass()) return false;
        AuthorDTO authorDTO = (AuthorDTO) o;
        return Objects.equals(name, authorDTO.name) && Objects.equals(birthDate, authorDTO.birthDate) && Objects.equals(bookslist, authorDTO.bookslist);
    }

    @Override
    public int hashCode() {
        return Objects.hash(id, name, birthDate, bookslist);
    }

    @Override
    public String toString() {
        return "AuthorDTO{" +
                "id=" + id +
                ", name='" + name + '\'' +
                ", birthDate=" + birthDate +
                ", bookslist=" + bookslist +
                '}';
    }
}
