import unittest
from rag_policy import is_pure_greeting, select_route, resolve_source_markers


class RagPolicyTests(unittest.TestCase):
    def test_only_complete_greetings_bypass_retrieval(self):
        self.assertTrue(is_pure_greeting(' Hi!! '))
        self.assertEqual(select_route('Assalamu alaikum', 'Fiqh/Knowledge'), 'Chit-Chat')
        for message in ['im going to do zinnah today', 'I plan to commit zina',
                        'hi, what does Islam say about patience?', 'I feel anxious',
                        'I am going to Lahore today', 'What should I do?']:
            with self.subTest(message=message):
                self.assertEqual(select_route(message, 'Chit-Chat'), 'Fiqh/Knowledge')

    def test_emotional_route_is_preserved(self):
        self.assertEqual(select_route('I feel anxious', 'Emotional'), 'Emotional')

    def test_source_ids_preserve_canonical_citations(self):
        chunks = [dict(citation='Quran 17:32 (Surah Al-Isra, Ayah 32)', source='Quran', text='Exact stored evidence.'),
                  dict(citation='Sahih al-Bukhari 1', source='Hadith', text='Another stored passage.')]
        reply, sources = resolve_source_markers('**[S1]:** "Evidence" [S1] [S99]', chunks)
        self.assertIn(chunks[0]['citation'], reply)
        self.assertNotIn('[S99]', reply)
        self.assertEqual(sources, [{k: chunks[0][k] for k in ('citation', 'source')}])
        self.assertEqual(resolve_source_markers('No evidence used.', chunks)[1], [])

    def test_generated_quotation_is_replaced_with_stored_evidence(self):
        chunks = [dict(citation='Canonical citation', source='Quran', text='Exact stored evidence.')]
        reply, sources = resolve_source_markers('• **[S1]:** "Invented paraphrase"', chunks)
        self.assertIn('"Exact stored evidence."', reply)
        self.assertNotIn('Invented paraphrase', reply)
        self.assertEqual(len(sources), 1)


if __name__ == '__main__':
    unittest.main()
