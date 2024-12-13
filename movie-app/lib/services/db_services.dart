import 'package:mysql1/mysql1.dart';

class DBService {
  final _settings = ConnectionSettings(
    host: 'localhost',
    port: 3306,
    user: 'root',
    password: null,
    db: 'movies_db',
  );

  Future<MySqlConnection> _getConnection() async {
    return await MySqlConnection.connect(_settings);
  }

  Future<List<Map<String, dynamic>>> getAllMovies() async {
    final conn = await _getConnection();
    final results = await conn.query('SELECT * FROM movies');
    List<Map<String, dynamic>> movies =
        results.map((row) => row.fields).toList();
    await conn.close();
    return movies;
  }

  Future<void> addMovie(String title, String description, String director,
      int year, String genre) async {
    final conn = await _getConnection();
    await conn.query(
      'INSERT INTO movies (title, description , director, release_year, genre) VALUES (?, ?, ?, ?, ?)',
      [title, description, director, year, genre],
    );
    await conn.close();
  }

  Future<Map<String, dynamic>?> getMovieById(int id) async {
    final conn = await _getConnection();
    final results = await conn.query(
      'SELECT * FROM movies WHERE id = ?',
      [id],
    );

    if (results.isEmpty) {
      await conn.close();
      return null;
    }

    final movie = results.first.fields;
    await conn.close();
    return movie;
  }

  Future<void> deleteMovie(int id) async {
    final conn = await _getConnection();
    await conn.query('DELETE FROM movies WHERE id = ?', [id]);
    await conn.close();
  }
}
