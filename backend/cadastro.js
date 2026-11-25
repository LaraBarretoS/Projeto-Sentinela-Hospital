'use strict';
const crypto=require('node:crypto');
const ROLES=['atendimento','triagem','medico','farmacia'];
const TTL=15*60*1000;
function hashSenha(senha){const salt=crypto.randomBytes(16).toString('hex');return `scrypt:${salt}:${crypto.scryptSync(senha,salt,64).toString('hex')}`;}
function confereSenha(senha,stored){if(typeof senha!=='string'||senha.length>100||typeof stored!=='string')return false;if(!stored.startsWith('scrypt:'))return senha===stored;try{const [,salt,h]=stored.split(':');const expected=Buffer.from(h,'hex');const actual=crypto.scryptSync(senha,salt,64);return expected.length===actual.length&&crypto.timingSafeEqual(expected,actual);}catch{return false;}}
function preparar(body,usuarios,pedidos,now=Date.now()){
 const {nome,usuario,senha,confirmacao,tipo}=body||{};
 if(typeof nome!=='string'||!nome.trim()||nome.trim().length>80)throw Error('Informe um nome de até 80 caracteres.');
 if(typeof usuario!=='string'||!/^[a-zA-Z0-9._-]{3,40}$/.test(usuario.trim()))throw Error('Informe um login válido de 3 a 40 caracteres.');
 if(typeof senha!=='string'||senha.length<6||senha.length>100||senha!==confirmacao)throw Error('Use uma senha de 6 a 100 caracteres e confirme-a corretamente.');
 if(!ROLES.includes(tipo))throw Error('Selecione uma área de acesso válida.');
 const login=usuario.trim();if(usuarios.some(u=>u.usuario.toLowerCase()===login.toLowerCase()))throw Error('Este login já está cadastrado.');
 if(pedidos.some(p=>p.usuario.toLowerCase()===login.toLowerCase()&&estado(p,now)==='pendente'))throw Error('Já existe uma solicitação ativa para este login. Aguarde expirar para solicitar outra.');
 if(pedidos.filter(p=>estado(p,now)==='pendente').length>=100)throw Error('Há muitas solicitações pendentes. Tente mais tarde.');
 const alphabet='ABCDEFGHJKLMNPQRSTUVWXYZ23456789';let codigo;do{codigo=Array.from({length:6},()=>alphabet[crypto.randomInt(alphabet.length)]).join('');}while(pedidos.some(p=>p.codigo===codigo&&estado(p,now)==='pendente'));
 return {id:crypto.randomUUID(),nome:nome.trim(),usuario:login,tipo,senha:hashSenha(senha),codigo,status:'pendente',tentativas:0,dataHora:new Date(now).toISOString(),expiraEm:now+TTL};
}
function estado(p,now=Date.now()){return p.status==='pendente'&&p.expiraEm<=now?'expirada':p.status;}
function verificar(p,codigo,now=Date.now()){
 if(!p||estado(p,now)!=='pendente')throw Error('Código expirado, bloqueado ou já utilizado. Solicite outro cadastro.');
 if(typeof codigo==='string'&&codigo.trim().replace(/[.\s]/g,'').toUpperCase()===p.codigo)return true;
 p.tentativas++;if(p.tentativas>=5){p.status='bloqueada';delete p.senha;delete p.codigo;}throw Error(p.status==='bloqueada'?'Limite de tentativas atingido. Solicite outro cadastro.':'Código incorreto. Confira com o administrador.');
}
function aviso(p,now=Date.now()){const status=estado(p,now);return {id:p.id,nome:p.nome,usuario:p.usuario,tipo:p.tipo,status,dataHora:p.dataHora,expiraEm:p.expiraEm,categoria:'cadastro',...(status==='pendente'?{codigo:p.codigo}: {})};}
module.exports={hashSenha,confereSenha,preparar,estado,verificar,aviso};
