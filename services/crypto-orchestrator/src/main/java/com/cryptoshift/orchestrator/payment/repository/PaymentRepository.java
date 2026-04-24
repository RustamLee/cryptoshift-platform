package com.cryptoshift.orchestrator.payment.repository;

import com.cryptoshift.orchestrator.payment.model.PaymentInvoice;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.UUID;


@Repository
public interface PaymentRepository extends JpaRepository<PaymentInvoice, UUID> {

}
