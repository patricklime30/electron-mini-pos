class Validation {
    static username(username) {

        if (!username) {
            return {
                valid: false,
                message: "Username wajib diisi."
            };
        }

        if (!/^[a-zA-Z0-9_]{3,20}$/.test(username)) {
            return {
                valid: false,
                message: "Username berisi huruf, angka dan garis bawah tanpa ada spasi."
            };
        }

        return {
            valid: true
        };
    }

    static phone(phone) {
        if(phone){
            if (!/^\d{10,15}$/.test(phone)) {
                return {
                    valid: false,
                    message: "No telp tidak cocok."
                };
            }
        }

        return {
            valid: true
        };
    }

    static password(password) {
        if (!password) {
            return {
                valid: false,
                message: "Password wajib diisi."
            };
        }

        if (password.length < 8) {
            return {
                valid: false,
                message: "Password min 8 karakter."
            };
        }

        if (!/[A-Z]/.test(password)) {
            return {
                valid: false,
                message: "Password harus ada 1 huruf kapital."
            };
        }

        if (!/[0-9]/.test(password)) {
            return {
                valid: false,
                message: "Password harus ada 1 angka."
            };
        }

        if (!/[!@#$%^&*(),.?":{}|<>_\-\\[\]\/+=~`]/.test(password)) {
            return {
                valid: false,
                message: "Password harus ada 1 simbol."
            };
        }

        return {
            valid: true
        };
    }
}