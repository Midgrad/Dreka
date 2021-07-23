#ifndef CLIPBOARD_CONTROLLER_H
#define CLIPBOARD_CONTROLLER_H

#include <QObject>

class QClipboard;

class ClipboardController : public QObject {
  Q_OBJECT

 public:
  explicit ClipboardController(QObject* parent = nullptr);

 public slots:
  void setText(const QString& text);

 private:
  QClipboard* const m_clipboard;
};

#endif  // CLIPBOARD_CONTROLLER_H
