import java.util.List;

public final class Main {
  public static void main(String[] args) {
    char[] data = new char[10];
    Reader reader = Files.newBufferedReader(Path.of("test"), StandardCharsets.UTF_8);
    while (reader.read(data) != -1) {
      useData(data);
    }
    
    reader.close();
  }
}