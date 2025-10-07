# RENDER Firebase Environment Variables Setup

## Add these 3 environment variables to Render:

Go to: https://dashboard.render.com → Your Service → Environment

### 1. FIREBASE_PROJECT_ID
```
raghost-port
```

### 2. FIREBASE_CLIENT_EMAIL
```
firebase-adminsdk-fbsvc@raghost-port.iam.gserviceaccount.com
```

### 3. FIREBASE_PRIVATE_KEY
**Important:** Copy the ENTIRE private key INCLUDING the BEGIN and END lines:
```
-----BEGIN PRIVATE KEY-----
MIIEvgIBADANBgkqhkiG9w0BAQEFAASCBKgwggSkAgEAAoIBAQDJQ8weepk4ChD8
U6X/0TB+R2jbkHGNkmrQxAhFHORZvqUUQp5pR7WFtcJVfuBsHHw2Ye9vaIIgHM4z
7Sr+NJBAeDHAve7v5WDjJ5idomqZJavag5RXCvUVqNnwjvv9IJrgD3PZ4gKBiLVc
HHr5svjTEdn7Yx55tHgitpp0hbPLmY5Tkyg+vRRckLyPeNcupOIEBidWk6RUTjNM
V33lQk9t0LaQOMr02k5ts8ndsls5kPjn0r0hC0dJrPCcp1h2nUtShA1VnjKo37oG
K16mJTu1sZhQDKd20z2HZfEONiOsogStYELCSMh9f9f5TYkkQsAnclCGBR+tKRwO
PTkOpFG5AgMBAAECggEADG884DEw4C53CC/e1KRG+7ZLuyz8ZwPBx64k2KhFT2og
5tSK1vRQObeWDxQsp2FHJ1D7qwVo7LT65GhlvJjgxKroYAEcDwQ77SzYF/0d2uJh
8LkqZApQRAtPk7YxyVzHVMp/nNmC0B/zHILB8kVlbBzxO7/O9TP6LCLd/g74ob55
6N6iIKOLQNuVxsNIz8oXEjilY6f3QkwQKhQAyxP0KR3zAmgvemEzfRkzYcsekVdD
3G/Y2S8A/B61mnHvvKATAF5ePPMOt2RibpggjkG4VEa+jgybUAV20xWabR2dG7Jr
UO9dnzN0fj7KkSPjL3BHFGcZLKw+C4RuL7TOUM4fgQKBgQDlk43sTxoCvNO0RBHs
SWsiA0gFr2fhtbjpnNdt27Byqi4N2Uz84OrXeVPy7ea93yuI21m9ewLzCpg/1CCP
3Ty2ExQttWftjvelYuUZc+bv0IMw+lXr6NH70w4xvNNKOxC11AunFZe32yqomFcX
UCREEkkzXSXpwlWEK55tAJ8YcQKBgQDgbgu/HJxv3ib1Tg27uXrRXsbhliQNVdp9
lbGTipDV7m6d0TXpm8OYMTeI2oUYbI1yV/t6XgcuLUVD5jVWcQ0mIfNYHRBK47dI
Gsxs4Ko/oTWPDbCTrtVC7y27u1l6VTWRJmwn76SAoBoUw+G/1AbOO5cnKeue4wUN
6yf+uRSxyQKBgDAQkYEtGnwCPqyaJ8p5oJVxbG3MSIqH+lvmu2/DtBB9ssCxgx3a
lTBhtYLB7jJIfBveGM7D510tFa0fY2XbYu+X1Pyw4z5oVU7qAp8uleYVmLHzZ3PJ
vdTkXi9poi8DaL840uu7aJVUrHy50FoQLFeYIH1BfkOPrUnLvBKEM8rxAoGBALaj
N3H2QaST/9Y/B9QONFGwNF8ehQZJKL5slI9CA23lVCWgPKR4eyseWlhHpGpk5JL5
4JALdwJwGt8Pt7Y51/6BQHwjYr/fIqdOD7BHAKU5dtGMzXbRn4GSDQCqjT2NnEMc
JoY1cgSuxarCYbNvQ36PZgmcBsBNdS6HgQu86IdpAoGBAKQsIbx1gDOn3vNl7KaN
lEKC8/eP/bSRlj1H5ESZDZKuRpZVf60lUiwWCiUsWn4XJ+2+YEcctVhJ/mhhPwHl
A+abe+FH/7EVEciz3j5pxMeTCIz0fvENafpYqHpIZXrGaN+X1EQBRq7JY4kPKMQR
leNDf33/f3FxCFNOhhT3PDkU
-----END PRIVATE KEY-----
```

**Note:** Make sure to paste it as a single value. Render will handle the newlines properly.

After adding these variables, Render will automatically redeploy and Firebase authentication will work! ✅
