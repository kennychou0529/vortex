import * as marked from 'marked';
import { h } from 'preact';

interface Props {
  markdown: string;
  className?: string;
}

export default function Markdown({ markdown, className }: Props) {
  return (<div className={className} dangerouslySetInnerHTML={{ __html: marked(markdown) }} />);
}
