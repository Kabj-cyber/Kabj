package com.detour.api.payments.config;

import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.stereotype.Component;

@Component
@ConfigurationProperties(prefix = "detour.payment")
public class PaymentProperties {

    private boolean sandbox = true;
    private String callbackBaseUrl = "http://localhost:8080";

    private MtnMomo mtnMomo = new MtnMomo();
    private VodafoneCash vodafoneCash = new VodafoneCash();
    private Paystack paystack = new Paystack();

    public boolean isSandbox() { return sandbox; }
    public void setSandbox(boolean sandbox) { this.sandbox = sandbox; }

    public String getCallbackBaseUrl() { return callbackBaseUrl; }
    public void setCallbackBaseUrl(String callbackBaseUrl) { this.callbackBaseUrl = callbackBaseUrl; }

    public MtnMomo getMtnMomo() { return mtnMomo; }
    public void setMtnMomo(MtnMomo mtnMomo) { this.mtnMomo = mtnMomo; }

    public VodafoneCash getVodafoneCash() { return vodafoneCash; }
    public void setVodafoneCash(VodafoneCash vodafoneCash) { this.vodafoneCash = vodafoneCash; }

    public Paystack getPaystack() { return paystack; }
    public void setPaystack(Paystack paystack) { this.paystack = paystack; }

    public static class MtnMomo {
        private String baseUrl = "https://sandbox.momodeveloper.mtn.com";
        private String subscriptionKey;
        private String apiUser;
        private String apiKey;
        private String targetEnvironment = "sandbox";
        private String currency = "GHS";

        public String getBaseUrl() { return baseUrl; }
        public void setBaseUrl(String baseUrl) { this.baseUrl = baseUrl; }

        public String getSubscriptionKey() { return subscriptionKey; }
        public void setSubscriptionKey(String subscriptionKey) { this.subscriptionKey = subscriptionKey; }

        public String getApiUser() { return apiUser; }
        public void setApiUser(String apiUser) { this.apiUser = apiUser; }

        public String getApiKey() { return apiKey; }
        public void setApiKey(String apiKey) { this.apiKey = apiKey; }

        public String getTargetEnvironment() { return targetEnvironment; }
        public void setTargetEnvironment(String targetEnvironment) { this.targetEnvironment = targetEnvironment; }

        public String getCurrency() { return currency; }
        public void setCurrency(String currency) { this.currency = currency; }

        public boolean isConfigured() {
            return subscriptionKey != null && !subscriptionKey.isBlank()
                    && apiUser != null && !apiUser.isBlank()
                    && apiKey != null && !apiKey.isBlank();
        }
    }

    public static class VodafoneCash {
        private String baseUrl = "https://api.hubtel.com";
        private String clientId;
        private String clientSecret;
        private String merchantAccountNumber;

        public String getBaseUrl() { return baseUrl; }
        public void setBaseUrl(String baseUrl) { this.baseUrl = baseUrl; }

        public String getClientId() { return clientId; }
        public void setClientId(String clientId) { this.clientId = clientId; }

        public String getClientSecret() { return clientSecret; }
        public void setClientSecret(String clientSecret) { this.clientSecret = clientSecret; }

        public String getMerchantAccountNumber() { return merchantAccountNumber; }
        public void setMerchantAccountNumber(String merchantAccountNumber) {
            this.merchantAccountNumber = merchantAccountNumber;
        }

        public boolean isConfigured() {
            return clientId != null && !clientId.isBlank()
                    && clientSecret != null && !clientSecret.isBlank()
                    && merchantAccountNumber != null && !merchantAccountNumber.isBlank();
        }
    }

    public static class Paystack {
        private String baseUrl = "https://api.paystack.co";
        private String secretKey;
        private String publicKey;

        public String getBaseUrl() { return baseUrl; }
        public void setBaseUrl(String baseUrl) { this.baseUrl = baseUrl; }

        public String getSecretKey() { return secretKey; }
        public void setSecretKey(String secretKey) { this.secretKey = secretKey; }

        public String getPublicKey() { return publicKey; }
        public void setPublicKey(String publicKey) { this.publicKey = publicKey; }

        public boolean isConfigured() {
            return secretKey != null && !secretKey.isBlank();
        }
    }
}
