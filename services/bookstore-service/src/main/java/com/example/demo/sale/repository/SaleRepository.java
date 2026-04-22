package com.example.demo.sale.repository;

import com.example.demo.sale.model.Sale;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface SaleRepository extends JpaRepository<Sale,Long> {
	boolean existsByUser_Id(Long userId);

	boolean existsByBooks_Seller_Id(Long sellerId);
}
