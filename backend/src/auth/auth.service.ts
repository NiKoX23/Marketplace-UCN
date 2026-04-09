import { Injectable } from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import * as jwt from 'jsonwebtoken';

@Injectable()
export class AuthService {
    
    private usuarios = [{
      rut: "12345678-9",
      pwdHash: "$2b$10$VmIv0x6VsdPQWef7cmo0f.XXVWyk/JQCnY0ctvkzgJiuTa1FbfWrW",
    }];

    private refreshTokens: string[] = [];
    
    login(rut: string, contraseña: string) {
        try {
            const usuario = this.usuarios.find(u => u.rut === rut);
            if (!usuario) return { ok: false };
    
            const match = bcrypt.compareSync(contraseña, usuario.pwdHash);
            if (!match) return { ok: false };
    
            const token = jwt.sign({ rut }, process.env.SECRET_KEY!, { expiresIn: "15m" });
            const refreshToken = jwt.sign({ rut }, process.env.REFRESH_SECRET_KEY!, { expiresIn: "7d" });
    
            this.refreshTokens.push(refreshToken);
    
            return { ok: true, token, refreshToken };

        } catch (error) {
            console.error('Login error:', error);
            return { ok: false, mensaje: 'Error interno' };
        }
    }

    refresh(token: string) {
        if (!this.refreshTokens.includes(token)) {
            return { ok: false };
        }

        try {
            const user: any = jwt.verify(token, process.env.REFRESH_SECRET_KEY!);
            const newToken = jwt.sign({ rut: user.rut }, process.env.SECRET_KEY!, { expiresIn: "15m" });

            return { ok: true, token: newToken };
        } catch {
            return { ok: false };
        }
    }

    logout(token: string) {
        this.refreshTokens = this.refreshTokens.filter(t => t !== token);
        return { ok: true };
    }
}
