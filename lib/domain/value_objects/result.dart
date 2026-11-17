/// Mônada Result<S, F> para tratamento de erros sem exceções.
///
/// Substitui completamente o uso de `throw` em fluxos de negócio,
/// garantindo que todo resultado é explicitamente tratado pelo chamador.
///
/// - [Success] carrega o valor de sucesso do tipo [S].
/// - [Failure] carrega o erro do tipo [F].
sealed class Result<S, F> {
  const Result();

  /// Aplica [onSuccess] se for [Success], ou [onFailure] se for [Failure].
  /// Garante tratamento exaustivo de ambos os caminhos.
  T fold<T>({
    required T Function(S valor) onSuccess,
    required T Function(F erro) onFailure,
  }) {
    return switch (this) {
      Success(:final valor) => onSuccess(valor),
      Failure(:final erro) => onFailure(erro),
    };
  }

  /// Retorna `true` se for [Success].
  bool get isSuccess => this is Success<S, F>;

  /// Retorna `true` se for [Failure].
  bool get isFailure => this is Failure<S, F>;
}

/// Representa um resultado bem-sucedido contendo [valor] do tipo [S].
final class Success<S, F> extends Result<S, F> {
  final S valor;
  const Success(this.valor);
}

/// Representa uma falha contendo [erro] do tipo [F].
final class Failure<S, F> extends Result<S, F> {
  final F erro;
  const Failure(this.erro);
}
