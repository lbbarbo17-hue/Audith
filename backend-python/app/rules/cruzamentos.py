def executar_regras(
        linha,
        numero,
        cadastro,
        depara):

    erros=[]

    from app.rules.estrutural import validar_estrutura
    from app.rules.cadastro import validar_cadastro
    from app.rules.verbas import validar_verba
    from app.rules.financeiro import validar_financeiro

    erros.extend(validar_estrutura(linha,numero))
    erros.extend(validar_cadastro(linha,cadastro,numero))
    erros.extend(validar_verba(linha,depara,numero))
    erros.extend(validar_financeiro(linha,numero))

    return erros